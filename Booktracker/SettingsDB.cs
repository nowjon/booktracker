using Microsoft.Data.Sqlite;

namespace bookTrackerApi {

    public static class SettingsDB {

        public static void updateLoggingLevel(string level) {

            SqliteConnection connection = DB.initiateConnection();
            string sql = "UPDATE settings SET value = @level WHERE name = 'logging_level'";
            SqliteCommand command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@level", level);
            command.ExecuteNonQuery();
            DB.closeConnection(connection);
            Program.loggingLevel = level;
        }

        public static string getLoggingLevel() {
            SqliteConnection connection = DB.initiateConnection();
            string sql = "SELECT * FROM settings WHERE name = 'logging_level'";
            SqliteCommand command = new SqliteCommand(sql, connection);
            using (SqliteDataReader reader = command.ExecuteReader()) {
                    string? logging_level = null;
                    while (reader.Read()) {
                        logging_level = reader.GetString(1);   
                    }
                    DB.closeConnection(connection);
                    return logging_level;
                }
        }

        public static void updateProgressTrackingMode(string mode) {
            SqliteConnection connection = DB.initiateConnection();
            string sql = "UPDATE settings SET value = @mode WHERE name = 'progress_tracking_mode'";
            SqliteCommand command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@mode", mode);
            command.ExecuteNonQuery();
            DB.closeConnection(connection);
        }

        public static string getProgressTrackingMode() {
            SqliteConnection connection = DB.initiateConnection();
            string sql = "SELECT * FROM settings WHERE name = 'progress_tracking_mode'";
            SqliteCommand command = new SqliteCommand(sql, connection);
            using (SqliteDataReader reader = command.ExecuteReader()) {
                    string? progress_mode = "percentage"; // default value
                    while (reader.Read()) {
                        progress_mode = reader.GetString(1);   
                    }
                    DB.closeConnection(connection);
                    return progress_mode;
                }
        }

    }

    public static class LoggingLevels {

        public static string all = "all";
        public static string error_only = "error_only";
        public static string error_and_warning = "error_and_warning";

    }

}    