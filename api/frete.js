export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { cep } = req.body;

    // Validação do CEP
    if (!cep) {
      return res.status(400).json({ erro: "CEP obrigatório" });
    }

    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return res.status(400).json({ erro: "CEP inválido" });
    }

    // Requisição para a API do Melhor Envio
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
            postal_code: "30140071"
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
          services: "1,2",
          options: {
            receipt: false,
            own_hand: false
          }
        })
      }
    );

    // Lê a resposta como texto para evitar falhas de parsing
    const text = await response.text();

    console.log("STATUS:", response.status);
    console.log("BODY:", text);

    let data = null;

    // Tenta converter para JSON
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        erro: "Resposta inválida da API",
        detalhe: text
      });
    }

    // Caso a API retorne null
    if (!data) {
      return res.status(200).json([
        {
          name: "Frete padrão",
          price: "20.00",
          delivery_time: 7
        }
      ]);
    }

    // Caso a API retorne erro estruturado
    if (data.errors) {
      return res.status(400).json({
        erro: "Erro na API do Melhor Envio",
        detalhe: data
      });
    }

    // Garante que a resposta seja um array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        erro: "Formato inesperado da API",
        detalhe: data
      });
    }

    // Filtra apenas opções válidas
    const fretesValidos = data.filter(f => !f.error);

    return res.status(200).json(fretesValidos);

  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao calcular frete",
      detalhe: error.message
    });
  }
}