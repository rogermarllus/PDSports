export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { cep } = req.body;

    if (!cep) {
      return res.status(400).json({ erro: "CEP obrigatório" });
    }

    const response = await fetch(
      "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify([
          {
            from: { postal_code: "34000-000" },
            to: { postal_code: cep },
            products: [
              {
                id: "1",
                width: 20,
                height: 5,
                length: 30,
                weight: 0.5,
                insurance_value: 100,
                quantity: 1
              }
            ]
          }
        ])
      }
    );

    const text = await response.text();
    console.log("RESPOSTA:", text);

    const data = JSON.parse(text);

    let fretesValidos = [];

    if (Array.isArray(data)) {
      fretesValidos = data.filter(f => !f.error);
    } else {
      return res.status(400).json({
        erro: "Resposta inesperada da API",
        detalhe: data
      });
    }

    return res.status(200).json(fretesValidos);

  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao calcular frete",
      detalhe: error.message
    });
  }
}