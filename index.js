const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");

const token = "5887552937:AAEzA_YUBpQa7rjtw3WT-wWDjpTJAP-3iEk";
const webAppUrl = "https://spiffy-pika-dee0b7.netlify.app";

const bot = new TelegramBot(token, { polling: true });
const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Нижче з'явиться кнопка, заповни форму", {
      reply_markup: {
        keyboard: [
          [{ text: "Заповнити форму", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });

    await bot.sendMessage(
      chatId,
      "Переходьте до нашого інтернет-магазину при натисканні кнопки нижче",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Зробити замовлення", web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      console.log(data);
      await bot.sendMessage(chatId, "Ваше прізвище: " + data?.surname);
      await bot.sendMessage(chatId, "Ваше ім'я: " + data?.name);
      await bot.sendMessage(chatId, "Ваш телефон: " + data?.tel);
      await bot.sendMessage(chatId, "Ваше повідомлення: " + data?.message);
      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          "Всю інформацію ви отримаєте у цьому чаті"
        );
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { queryId, products = [], totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Покупка успішна!",
      input_message_content: {
        message_text: `Дякуємо за покупку!  Ви придбали товар на загальну суму ${totalPrice} грн., ${products
          .map((item) => item.title)
          .join(", ")}`,
      },
    });
    return res.status(200).json(reult);
  } catch (error) {
    return res.status(500).json(result);
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log("server started on PORT " + PORT));
