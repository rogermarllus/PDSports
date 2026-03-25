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

    const payload = {
      from: { postal_code: "01001000" },
      to: { postal_code: cepLimpo },
      package: {
        width: 20,
        height: 5,
        length: 30,
        weight: 0.5
      },
      options: {
        receipt: false,
        own_hand: false,
        collect: false,
        insurance_value: 100
      }
    };

    const response = await fetch(
      "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
          "User-Agent": "PDSports (seuemail@gmail.com)"
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await response.text();
    console.log("STATUS:", response.status);
    console.log("BODY:", text);

    if (!text || text.trim() === "") {
      return res.status(502).json({
        erro: "API retornou resposta vazia",
        status_http: response.status
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        erro: "Resposta inválida da API (não é JSON)",
        detalhe: text
      });
    }

    if (data.errors || data.message) {
      return res.status(400).json({
        erro: "Erro retornado pela API do Melhor Envio",
        detalhe: data
      });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({
        erro: "Formato inesperado da API",
        detalhe: data
      });
    }

    const fretesValidos = data.filter(f => !f.error && f.price);

    return res.status(200).json(fretesValidos);

  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno ao calcular frete",
      detalhe: error.message
    });
  }
}