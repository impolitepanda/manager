/**
 * @ngdoc directive
 * @name ovh-angular-mondial-relay.directive:mondialRelay
 * @scope
 * @restrict EA
 * @description
 * <p>Display Modial relay map for relay selection</p>
 * @example
   <example module="Module">
   <file name="index.html">
        <div ng-controller="mainCtrl">
            <mondial-relay data-ng-model="selectedRelay">
            </mondial-relay>
            <pre data-ng-bind="display(selectedRelay)"></pre>
        </div>
   </file>
   <file name="script.js">
        angular.module("Module", []);
        angular.module("Module").controller("mainCtrl", function() {
            $scope.display = function (obj) {
                return obj ? JSON.stringify(obj) : "";
            };
        });
   </file>
   </example>
 * @param {string} ng-model Variable that will recieve the selected relay.
 * @param {string} [user-service='User'] The name of your user service, in case your service name is different from the default.
 */
angular.module("ovh-angular-mondial-relay")
    .directive("mondialRelay", function ($translate, MONDIAL_RELAY, MONDIAL_RELAY_PICS) {
        "use strict";

        /**
         * Build the bound box to recenter the map. The box is growing to include all points
         * @param   {Bounds} bounds Bounding box
         * @param   {Object} point  Point {lat, lng}
         * @param {boolean=} first  Must be true for the first point (this will initialize the bound box)
         */
        var appendBound = function appendBound (bounds, point, first) {
            var margin = 0.01;
            bounds.northEast.lat = first || point.lat + margin > bounds.northEast.lat ? bounds.northEast.lat = point.lat + margin : bounds.northEast.lat;
            bounds.southWest.lat = first || point.lat - margin < bounds.southWest.lat ? bounds.southWest.lat = point.lat - margin : bounds.southWest.lat;
            bounds.northEast.lng = first || point.lng + margin > bounds.northEast.lng ? bounds.northEast.lng = point.lng + margin : bounds.northEast.lng;
            bounds.southWest.lng = first || point.lng - margin < bounds.southWest.lng ? bounds.southWest.lng = point.lng - margin : bounds.southWest.lng;
            return bounds;
        };

        /**
         * Convert marker index in marker name
         * @param {Number} index Index of the marker [0..25]
         * @returns {String}
         */
        var getMarkerName = function getMarkerName (index) {
            return String.fromCharCode(65 + index);
        };

        /**
         * Generate the icon object for the marker
         * @param index
         * @returns {{iconUrl: string, shadowUrl: string, iconSize: number[], shadowSize: number[], iconAnchor: number[], shadowAnchor: number[], popupAnchor: *[]}}
         */
        var getMarkerIcon = function getMarkerIcon (index) {
            return _.extend(
                {
                    iconUrl: MONDIAL_RELAY_PICS["gmaps_pr02" + getMarkerName(index)], // "components/mondial-relay/assets/gmaps_pr02" + getMarkerName(index) + ".png",
                    shadowUrl: MONDIAL_RELAY_PICS.gmaps_pr_shadow // "components/mondial-relay/assets/gmaps_pr_shadow.png",
                },
                _.pick(MONDIAL_RELAY, ["iconSize", "shadowSize", "iconAnchor", "shadowAnchor", "popupAnchor"])
            );
        };

        /**
         * Reformat the opening hours of the relays
         * @param {Object} opening Structure describing opening times {monday: [{start: "0800", end:"1900"}]}
         * @returns {Array} List of open days [{days: ["monday", "tuesday"], hours: ["08:00-19:00"]}]
         */
        var reformatOpening = function reformatOpening (opening) {
            var reformatTime = function (openingTime) {
                return openingTime.substring(0, 2) + ":" + openingTime.substring(2, 4);
            };
            var getAllOpenings = function (openingTimes) {
                return _.map(openingTimes, function (openingTime) {
                    return [
                        reformatTime(openingTime.start),
                        reformatTime(openingTime.end)
                    ].join("—");
                });
            };

            var result = MONDIAL_RELAY.weekDays.map(function (weekDay) {
                return {
                    days: [weekDay],
                    hours: getAllOpenings(opening[weekDay])
                };
            });
            result.map(function (relayDay, i) {
                var index = 1;

                // relayDay without hours parameter === closed (yet kept in array)
                if (!relayDay.hours) {
                    return relayDay;
                }

                // In order to group following opening days with equal time windows
                // We loop until time windows are different (or at the end of the array)
                while (i + index < result.length && _.isEqual(relayDay.hours, result[i + index].hours)) {
                    relayDay.days = _.union(relayDay.days, result[i + index].days);
                    // Also we remove duplicate line
                    delete result[i + index];
                    index++;
                }

                // Then we build regarding the nature of each relayDay (single time windows, grouped ones or closed)
                if (relayDay.days.length > 1) {
                    relayDay.days = $translate.instant("components_mondial_relay_" + relayDay.days[0]) + ". " + $translate.instant("components_mondial_relay_hours_to") + " " + $translate.instant("components_mondial_relay_" + relayDay.days[relayDay.days.length - 1]).toLowerCase() + ".";
                } else if (relayDay.days.length) {
                    relayDay.days = $translate.instant("components_mondial_relay_" + relayDay.days[0] + "_long");
                }
                return result[i];
            });

            return result;
        };

        return {
            restrict: "AE",
            bindToController: true,
            scope: {
                ngModel: "=?",
                userService: "=?",
                mondialRelayService: "=?"
            },
            templateUrl: "ovh-angular-mondial-relay/ovh-angular-mondial-relay.view.html",
            controllerAs: "$ctrl",
            controller: function ($http, $injector, $q, $scope, $timeout, leafletBoundsHelpers, leafletData, leafletEvents, mondialRelay) {

                var self = this;

                this.loading = {
                    init: true,
                    search: false
                };

                this.mapId = _.uniqueId("mondial-relay");

                /**
                 * Render the results into the map and list
                 * @param {Object} data API response
                 */
                this.getResult = function (data) {
                    if (data && data.relayPoints) {
                        this.foundRelays = data.relayPoints;
                        this.referenceAddress = data.referenceAddress;
                        this.map.markers = _.map(this.foundRelays, function (relay, index) {
                            relay.opening = reformatOpening(relay.opening);
                            appendBound(self.map.bounds, relay, !index);
                            relay.marker = getMarkerName(index);
                            return {
                                lat: relay.lat,
                                lng: relay.lng,
                                message: (Math.round(relay.distance / 100) / 10) + " km",
                                icon: getMarkerIcon(index),
                                opacity: 0.7,
                                focus: false,
                                index: index
                            };
                        });
                        this.setMarkerListeners();
                    } else {
                        this.message = $translate.instant("components_mondial_relay_not_available");
                    }
                };

                /**
                 * Register the listener on all the markers
                 */
                this.setMarkerListeners = function () {
                    // kills the old broadcasters
                    _.forEach(this.broadcasters, function (broadcaster) {
                        broadcaster();
                    });

                    // settle the new broacasters
                    this.broadcasters = _.map(leafletEvents.getAvailableMarkerEvents(), function (markerEvent) {
                        return $scope.$on(
                            "leafletDirectiveMarker." + markerEvent,
                            function (event, args) {
                                switch (event.name) {
                                case "leafletDirectiveMarker.mouseover" :
                                    self.markerHover(args.model.index);
                                    break;
                                case "leafletDirectiveMarker.mouseout" :
                                    self.markerHover();
                                    break;
                                case "leafletDirectiveMarker.click":
                                    self.select(self.foundRelays[args.model.index]);
                                    break;
                                default:
                                    break;
                                }
                            }
                        );
                    });
                };

                /**
                 * Action to perform when the mouse is over the marker
                 * @param {int} relayIndex index of the relay
                 */
                this.markerHover = function (relayIndex) {
                    _.forEach(this.foundRelays, function (relay, index) {
                        delete relay.markerHover;
                        var opacity = index !== relayIndex ? 0.7 : 1;
                        if (self.map.markers[index].selected) {
                            opacity = 1;
                        }
                        self.map.markers[index].opacity = opacity;
                    });
                    if (!_.isUndefined(relayIndex)) {
                        this.foundRelays[relayIndex].markerHover = true;
                        this.map.markers[relayIndex].opacity = 1;
                    }
                };

                /**
                 * Perform a search
                 * @return {Promise}
                 */
                this.search = function (filter) {
                    this.message = null;
                    this.referenceAddress = "";
                    this.loading.search = true;
                    this.ngModel = null;
                    this.foundRelays = [];
                    var parsedFilter = filter;

                    if (!parsedFilter) {
                        parsedFilter = this.filter;
                        var searchQuery = _.get(parsedFilter, "searchQuery", "");
                        if (searchQuery) {
                            var zipcode = _.compact(searchQuery.match(/\d{5}/g));
                            if (zipcode.length) {
                                parsedFilter.zipcode = _.first(zipcode).trim();
                            } else {
                                var city = _.compact(searchQuery.match(/^[A-z\u00C0-\u024F][A-z\u00C0-\u024F'\s\-]*[A-z\u00C0-\u024F]$/g));
                                if (city.length) {
                                    parsedFilter.city = _.first(city).trim();
                                }
                            }
                            delete parsedFilter.searchQuery;
                        }
                    }

                    return this.mondialRelayService.v6().search(
                        filter,
                        $scope
                    )
                        .then(function (resp) {
                            self.userSearch = true;
                            return self.getResult(resp);
                        })
                        .catch(function (err) {
                            self.message = $translate.instant("components_mondial_relay_not_found");
                            return $q.reject(err);
                        })
                        .finally(function () {
                            self.loading.search = false;
                        });
                };

                /**
                 * Action to perform whan a relay is selected
                 * @param relay
                 */
                this.select = function (selectedRelay) {
                    var relayIndex = this.foundRelays.indexOf(selectedRelay);
                    _.forEach(this.foundRelays, function (relay) {
                        delete relay.selected;
                    });
                    _.forEach(this.map.markers, function (marker, index) {
                        marker.focus = false;
                        marker.opacity = relayIndex !== index ? 0.7 : 1;
                        marker.selected = (relayIndex === index);
                    });
                    selectedRelay.selected = true;
                    this.ngModel = selectedRelay;
                };

                /**
                 * Initialize a search to user location
                 * @return {Promise}
                 */
                this.gotoUserLoc = function () {
                    this.userService.v6().get().$promise.then(function (me) {
                        if (!self.userSearch) {
                            var filter = {
                                country: me.country.toLowerCase() || MONDIAL_RELAY.defaultCountry
                            };

                            // metropolitan france only
                            if (MONDIAL_RELAY.metroFrZipValidator.test(me.zip)) {
                                filter.zipcode = me.zip;
                            } else if (me.city) {
                                filter.city = me.city;
                            }
                            return self.search(filter);
                        }
                        return me;
                    }).catch(function (err) {
                        return $http.get(MONDIAL_RELAY.ipLocUrl).then(function (geoloc) {
                            if (MONDIAL_RELAY.metroFrZipValidator.test(geoloc.data.zip_code) && geoloc.data.country_code) {
                                return self.search({
                                    country: geoloc.data.country_code.toLowerCase(),
                                    zipcode: geoloc.data.zip_code
                                });
                            } else if (geoloc.data.city && geoloc.data.country_code) {
                                return self.search({
                                    country: geoloc.data.country_code.toLowerCase(),
                                    city: geoloc.data.city
                                });
                            }
                            self.map.center = {
                                lat: geoloc.data.latitude,
                                lng: geoloc.data.longitude,
                                zoom: 5
                            };
                            return $q.reject(err);
                        });
                    });
                };

                /*= =====================================
                =            INITIALIZATION            =
                ======================================*/

                this.init = function () {

                    this.logoPic64 = MONDIAL_RELAY_PICS.logo;
                    this.userService = this.userService || $injector.get("OvhApiMe");
                    this.mondialRelayService = this.mondialRelayService || $injector.get("OvhApiSupplyMondialRelay");

                    this.map = {
                        focus: MONDIAL_RELAY.initialLocation,
                        center: {},
                        markers: [],
                        bounds: leafletBoundsHelpers.createBoundsFromArray(MONDIAL_RELAY.initialBoundingBox),
                        events: {
                            markers: {
                                enable: leafletEvents.getAvailableMarkerEvents()
                            }
                        }
                    };

                    this.broadcasters = [];
                    this.foundRelays = [];
                    this.ngModel = null;
                    this.filter = {
                        country: MONDIAL_RELAY.defaultCountry
                    };

                    // workaround to fix display bug on the map
                    leafletData.getMap(self.mapId).then(function (map) {
                        self.leafletMap = map;
                        $timeout(function () {
                            map.invalidateSize();
                            map.fitBounds(MONDIAL_RELAY.initialBoundingBox);
                        });
                    });

                    return mondialRelay.loadTranslations().finally(function () {
                        self.loading.init = false;
                        return self.gotoUserLoc();
                    });

                };

                /* -----  End of INITIALIZATION  ------*/

                this.init();

            }
        };
    });
