export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { cep } = req.body;

    if (!cep) {
      return res.status(400).json({ erro: "CEP obrigatório" });
    }

    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return res.status(400).json({ erro: "CEP inválido" });
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
            from: {
              postal_code: "34006065"
            },
            to: {
              postal_code: cepLimpo
            },
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
            ],
            options: {
              receipt: false,
              own_hand: false
            }
          }
        ])
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        erro: "Resposta inválida da API",
        detalhe: text
      });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({
        erro: "Resposta inesperada da API",
        detalhe: data
      });
    }

    const fretesValidos = data.filter(f => !f.error);

    return res.status(200).json(fretesValidos);

  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao calcular frete",
      detalhe: error.message
    });
  }
}