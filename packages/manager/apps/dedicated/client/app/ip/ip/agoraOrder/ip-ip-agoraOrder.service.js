import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import {
  FETCH_PRICE_MAX_TRIES,
  PRODUCT_TYPES,
} from './ip-ip-agoraOrder.constant';

angular.module('Module.ip.services').service(
  'IpAgoraOrder',
  class {
    /* @ngInject */
    constructor($q, OvhHttp) {
      this.$q = $q;
      this.OvhHttp = OvhHttp;

      this.fetchPricesTries = 0;
    }

    handleErrorOrServices({ errors, results }) {
      const filteredErrors = errors.filter(({ msg }) => {
        const [errorCode] = msg.match(/\d+/);
        return parseInt(errorCode, 10) !== 400;
      });
      if (isArray(filteredErrors) && !isEmpty(filteredErrors)) {
        return this.$q.reject(filteredErrors);
      }

      return get(results, '[0].services', []);
    }

    fetchProducts(product) {
      return this.OvhHttp.get('/products', {
        rootPath: '2api',
        params: {
          product,
        },
      });
    }

    getServices() {
      return this.$q
        .all([
          this.fetchProducts(
            PRODUCT_TYPES.privateCloud.apiTypeName,
          ).then((privateClouds) => this.handleErrorOrServices(privateClouds)),
          this.fetchProducts(
            PRODUCT_TYPES.dedicatedServer.apiTypeName,
          ).then((dedicatedServers) =>
            this.handleErrorOrServices(dedicatedServers),
          ),
          this.fetchProducts(PRODUCT_TYPES.vps.apiTypeName).then((vps) =>
            this.handleErrorOrServices(vps),
          ),
        ])
        .then(([privateClouds, dedicatedServers, vps]) => [
          ...privateClouds.map((privateCloud) => ({
            ...privateCloud,
            type: PRODUCT_TYPES.privateCloud.typeName,
          })),
          ...dedicatedServers.map((dedicatedServer) => ({
            ...dedicatedServer,
            type: PRODUCT_TYPES.dedicatedServer.typeName,
          })),
          ...vps.map((vpsService) => ({
            ...vpsService,
            type: PRODUCT_TYPES.vps.typeName,
          })),
        ]);
    }

    getIpOffers(ovhSubsidiary = 'US') {
      return this.OvhHttp.get('/order/catalog/formatted/ip', {
        rootPath: 'apiv6',
        params: {
          ovhSubsidiary,
        },
      }).then(({ plans }) => plans);
    }

    fetchPrices(serviceName, blockSize) {
      this.fetchPricesTries += 1;
      return this.OvhHttp.get(
        `/order/cartServiceOption/privateCloud/${serviceName}`,
        {
          rootPath: 'apiv6',
        },
      )
        .then((offers) => {
          this.fetchPricesTries = 0;
          const matchingOffers = offers
            .filter((offer) => offer.family === 'ip')
            .filter((offer) => offer.planCode.includes(blockSize));

          return [].concat(
            ...matchingOffers.map((offer) =>
              offer.prices.map((price) => ({
                planCode: offer.planCode,
                duration: price.duration,
                price: price.price.text,
              })),
            ),
          );
        })
        .catch((error) => this.retryFetchPrices(error, serviceName, blockSize));
    }

    retryFetchPrices(error, ...args) {
      if (this.fetchPricesTries === FETCH_PRICE_MAX_TRIES) {
        return this.$q.reject(error);
      }

      return this.fetchPrices(...args);
    }

    static createProductToOrder({
      configuration = [],
      country,
      description,
      destination,
      duration = 'P1M',
      organisation,
      netname,
      planCode,
      productId = 'ip',
      pricingMode = 'default',
      quantity = 1,
      serviceName,
    }) {
      const productToOrder = {
        configuration,
        duration,
        planCode,
        pricingMode,
        productId,
        quantity,
        serviceName,
      };

      if (description) {
        productToOrder.configuration.push({
          label: 'description',
          value: description,
        });
      }

      if (netname) {
        productToOrder.configuration.push({
          label: 'netname',
          value: netname,
        });
      }

      if (destination) {
        productToOrder.configuration.push({
          label: 'destination',
          value: destination,
        });
      }

      if (country) {
        productToOrder.configuration.push({
          label: 'country',
          value: country,
        });
      }

      if (organisation) {
        productToOrder.configuration.push({
          label: 'organisation',
          value: organisation,
        });
      }

      return productToOrder;
    }

    getVpsIpCountryAvailable(serviceName) {
      return this.OvhHttp.get(`/vps/${serviceName}/ipCountryAvailable`, {
        rootPath: 'apiv6',
      });
    }
  },
);
