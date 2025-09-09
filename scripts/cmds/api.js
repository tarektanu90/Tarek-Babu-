import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class TelegramGroupRename {
    public static void main(String[] args) {
        try {
            // Replace with your own bot token and chat ID
            String botToken = "YOUR_BOT_TOKEN";
            String chatId = "-1001234567890"; // Supergroup ID (negative for groups)
            String newTitle = "My New Group Name";

            // Telegram API endpoint
            String urlString = "https://api.telegram.org/bot" + botToken + "/setChatTitle";
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);

            // Send payload
            String payload = "chat_id=" + chatId + "&title=" + newTitle;
            try (OutputStream os = conn.getOutputStream()) {
                os.write(payload.getBytes());
            }

            // Response
            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                System.out.println("✅ Group name changed successfully!");
            } else {
                System.out.println("❌ Failed, response code: " + responseCode);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
