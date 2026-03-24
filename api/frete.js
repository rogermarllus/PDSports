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
        body: JSON.stringify({
          from: {
            postal_code: "34006065"
          },
          to: {
            postal_code: cepLimpo
          },
          packages: [
            {
              width: 20,
              height: 5,
              length: 30,
              weight: 0.5,
              insurance: 100
            }
          ],
          options: {
            receipt: false,
            own_hand: false
          }
        })
      }
    );

    const data = await response.json();

    // Se vier erro da API
    if (data.errors) {
      return res.status(400).json({
        erro: "Erro na API do Melhor Envio",
        detalhe: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao calcular frete",
      detalhe: error.message
    });
  }
}