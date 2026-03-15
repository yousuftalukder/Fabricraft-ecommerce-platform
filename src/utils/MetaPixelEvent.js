const delayedPixelEventStandard = (eventName, params, delay = 1000) => {
  try{
    setTimeout(() => {
      if (typeof fbq !== 'undefined') {
        // eslint-disable-next-line
        fbq('track', eventName, params);
      } else {
        console.warn(`fbq is not defined for event: ${eventName}`);
      }
    }, delay);
  }
  catch(ex) {
    console.log("delayedPixelEventStandard exception:", ex);
  }
};

const delayedPixelEventCustom = (eventName, params, delay = 1000) => {
  try{
    setTimeout(() => {
      if (typeof fbq !== 'undefined') {
        // eslint-disable-next-line
        fbq('trackCustom', eventName, params);
      } else {
        console.warn(`fbq is not defined for event: ${eventName}`);
      }
    }, delay);
  }
  catch(ex) {
    console.log("delayedPixelEventCustom exception:", ex);
  }
};

export const homePagePixelEvent = () => {
  delayedPixelEventCustom('Home-Page-Visited');
}

export const cartPagePixelEvent = () => {
  delayedPixelEventCustom('Cart-Page-Visited');
}

export const WishListPagePixelEvent = () => {
  delayedPixelEventCustom('Wishlist-Page-Visited'); // Custom event using trackCustom
}

export const categoryPagePixelEvent = () => {
  delayedPixelEventCustom('Category-Page-Visited');
}

export const DeliveryDetailsPagePixelEvent = () => {
  delayedPixelEventCustom('Delivery-Details-Page-Visited');
}

export const OfferPagePixelEvent = () => {
  delayedPixelEventCustom('Offer-Page-Visited');
}

export const OrderHistoryPagePixelEvent = () => {
  delayedPixelEventCustom('Offer-History-Page-Visited');
}

export const OrderSuccessPagePixelEvent = () => {
  delayedPixelEventCustom('Offer-Success-Page-Visited');
}

export const ProfilePagePixelEvent = () => {
  delayedPixelEventCustom('Profile-Page-Visited');
}

export const SearchPagePixelEvent = () => {
  delayedPixelEventCustom('Search-Page-Visited');
}

export const ShopPagePixelEvent = () => {
  delayedPixelEventCustom('Shop-Page-Visited');
}

export const OrderDetailsPagePixelEvent = (order) => {
  try{
    delayedPixelEventCustom('Order-Details-Page-Visited', {
      order_id: order.order_id,
    });
  }
  catch(ex) {
    console.log("OrderDetailsPagePixelEvent exception:", ex);
  }
}

export const categoryProductsPagePixelEvent = (category) => {
  try{
    delayedPixelEventCustom('Category-Products-Page-Visited', {
      category: category,
    });
  }
  catch(ex) {
    console.log("categoryProductsPagePixelEvent exception:", ex);
  }
}

export const addToCartPixelEvent = (product) => {
  try{
    delayedPixelEventStandard('AddToCart', {
      content_ids: [product.product_id],
      content_type: 'product',
      value: product.product_price,
      currency: 'BDT',
    });
  }
  catch(ex) {
    console.log("addToCartPixelEvent exception:", ex);
  }
};

export const addToWishlistPixelEvent = (product) => {
  try{
    delayedPixelEventStandard('AddToWishlist', {
      content_ids: [product.product_id],
      content_type: 'product',
      value: product.product_price,
      currency: 'BDT',
    });
  }
  catch(ex) {
    console.log("addToWishlistPixelEvent exception:", ex);
  }
};

export const purchasePixelEvent = (order) => {
  try{
    delayedPixelEventStandard('Purchase', {
      content_ids: order.ordered_products.map(item => item.product.product_id),
      content_type: 'product',
      value: order.order_calculations.total_price,
      currency: 'BDT',
    });
  }
  catch(ex) {
    console.log("purchasePixelEvent exception:", ex);
  }
};

export const searchPixelEvent = (searchQuery) => {
  try{
    delayedPixelEventStandard('Search', {
      search_string: searchQuery,
    });
  }
  catch(ex) {
    console.log("searchPixelEvent exception:", ex);
  }
};

export const productViewPixelEvent = (product) => {
  try {
    delayedPixelEventStandard('ViewContent', {
      content_ids: [product.product_id],
      content_type: 'product',
      value: product.product_price,
      currency: 'BDT',
    });
  } catch (ex) {
    console.log("productViewPixelEvent exception:", ex);
  }
};

export const initiatePurchasePixelEvent = (order) => {
  try {
    delayedPixelEventStandard('InitiateCheckout', {
      content_ids: order.ordered_products.map(item => item.product.product_id),
      content_type: 'product',
      value: order.order_calculations.total_price,
      currency: 'BDT',
      num_items: order.ordered_products.length,
    });
  } catch (ex) {
    console.log("initiatePurchasePixelEvent exception:", ex);
  }
};
