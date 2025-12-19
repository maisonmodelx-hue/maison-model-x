// This function sits between your frontend and Bitrix24
// Token stays SECRET in environment variables

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const action = body.action; // e.g., 'createContact', 'createDeal'
    
    // Get your Bitrix24 webhook from environment variables (NOT from browser)
    const BITRIX24_WEBHOOK = process.env.BITRIX24_WEBHOOK;
    
    if (!BITRIX24_WEBHOOK) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Bitrix24 webhook not configured' })
      };
    }

    let endpoint = '';
    let payload = {};

    // Route different actions to different Bitrix24 endpoints
    if (action === 'createContact') {
      endpoint = `${BITRIX24_WEBHOOK}/crm.contact.add`;
      payload = { fields: body.fields };
    } 
    else if (action === 'createDeal') {
      endpoint = `${BITRIX24_WEBHOOK}/crm.deal.add`;
      payload = { fields: body.fields };
    }
    else if (action === 'getContacts') {
      endpoint = `${BITRIX24_WEBHOOK}/crm.contact.list`;
      payload = { filter: body.filter || {} };
    }
    else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Unknown action' })
      };
    }

    // Call Bitrix24 from backend (token is hidden)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Return only what frontend needs
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Bitrix24 Proxy Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
