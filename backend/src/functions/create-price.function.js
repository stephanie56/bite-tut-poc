import { Stripe } from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2020-03-02',
});

export const createPrice = async (req, context) => {
  console.log('event', req.body)
  const { sys, fields } = JSON.parse(req.body);

  if (sys.contentType.sys.id !== `product`) {
    return;
  }

  try {
    const productName = fields.productName['en-US'];
    const productPrice = fields.price['en-US'];
    const productId = sys.id;


    const product = await stripe.products.create({
      name: productName,
    });

    console.log('product', product)

    const price = await stripe.prices.create({
      unit_amount: parseInt(productPrice, 10) * 100,
      currency: 'cad',
      recurring: { interval: 'month' },
      product: product.id,
      metadata: {
        contentfulProductId: productId
      }
    });

    console.log('price', price)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: `create plan ${price.id} success`,
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      body: JSON.stringify({
        message: `Failed to create plan ${err.message}`,
      }),
    };
  }
};
