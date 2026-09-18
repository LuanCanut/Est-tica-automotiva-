require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL || ADMIN_EMAIL;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE) === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    const { nome, veiculo, servico, data } = req.body;

    if (!nome || !veiculo || !servico || !data) {
      return res.status(400).json({
        error: 'Preencha todos os campos.'
      });
    }

    const dataFormatada = new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Novo agendamento - ${veiculo}`,
      text: `Novo agendamento de lavagem.

Nome: ${nome}
Veículo: ${veiculo}
Serviço: ${servico}
Data e horário: ${dataFormatada}

WhatsApp: https://wa.me/5593991103961`
    });

    res.json({ ok: true });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: 'Falha ao enviar a notificação por e-mail.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
