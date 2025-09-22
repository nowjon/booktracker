using Newtonsoft.Json;
using System.Text;

namespace bookTrackerApi {

    public static class SettingsEndpoints {

        public static void configure(WebApplication app) {

            app.MapGet("/api/data/export", (String format, String sessionKey, HttpContext context) => {
                string? remoteIp = context.Connection.RemoteIpAddress?.ToString();
                SessionInfo? currentSession = Program.Sessions.Find(s => s.Session == sessionKey);
                if (currentSession == null) {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_sessionKey, "export", null, remoteIp); 
                    return Results.BadRequest(errorMessage);
                }
                List<DB.BookPageInfo> ListOfBookData = DB.getBookDataForExport(int.Parse(currentSession.AssociatedID));
                if (format == "json") {
                    JsonLog.writeLog("JSON export requested.", "INFO", "export", currentSession, remoteIp);
                    Export.ExportDataAsJSON(ListOfBookData, currentSession.Username);
                } else if (format == "csv") {
                    JsonLog.writeLog("CSV export requested.", "INFO", "export", currentSession, remoteIp);
                    Export.ExportDataAsCSV(ListOfBookData, currentSession.Username);
                } else {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_paramter, "export", currentSession, remoteIp);
                    return Results.BadRequest(errorMessage);
                }
                byte[] test = File.ReadAllBytes($"external/export/{currentSession.Username}-export.{format}");
                return Results.File(test, "text/csv", $"bookExport.{format}");
            })
            .Produces<ErrorMessage>(StatusCodes.Status400BadRequest)
            .Produces<FileStream>(StatusCodes.Status200OK)
            .WithTags("Settings")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Returns a file for download with all of a user's data",
                Description = "Format depends on the 'format' inline parameter. The options are 'csv' and 'json'."
            });



            app.MapPost("/api/data/import", async (String format, String sessionKey, IFormFile file, HttpContext context) => {
                string? remoteIp = context.Connection.RemoteIpAddress?.ToString();
                SessionInfo? currentSession = Program.Sessions.Find(s => s.Session == sessionKey);
                if (currentSession == null) {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_sessionKey, "import", null, remoteIp); 
                    return Results.BadRequest(errorMessage);
                }
                if (format == "goodreads") {
                    await Import.ImportFromGoodreads(file, currentSession);
                    JsonLog.writeLog("Goodreads data import processed.", "INFO", "import", currentSession, remoteIp);
                    return Results.Ok();
                } else {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_paramter, "import", currentSession, remoteIp);
                    return Results.BadRequest();
                }
            })
            .Produces<ErrorMessage>(StatusCodes.Status400BadRequest)
            .Produces<string>(StatusCodes.Status200OK)
            .WithTags("Settings")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Imports data from an external source.",
                Description = "Format depends on the 'format' inline parameter. The options are 'goodreads'."
            });

            

            app.MapGet("/api/test/test", () => {
                return Results.Ok("test");
            })
            .Produces<string>(StatusCodes.Status200OK)
            .WithTags("Settings");



            app.MapPut("/api/settings", (String results, String sessionKey) => {
                SessionInfo? currentSession = Program.Sessions.Find(s => s.Session == sessionKey);
                if (currentSession == null) {
                    return Results.BadRequest();
                }
                ApiClient.Results = int.Parse(results);
                return Results.Ok();
            })
            .Produces<string>(StatusCodes.Status400BadRequest)
            .Produces<string>(StatusCodes.Status200OK)
            .WithTags("Settings")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Changes settings globally for all users."
            });

            app.MapPut("/api/settings/loggingLevel", (String level, String sessionKey, HttpContext context) => {
                string? remoteIp = context.Connection.RemoteIpAddress?.ToString();
                SessionInfo? currentSession = Program.Sessions.Find(s => s.Session == sessionKey);
                if (currentSession == null) {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_sessionKey, "settings_loggingLevel", null, remoteIp); 
                    return Results.BadRequest(errorMessage);
                }
                if (currentSession.IsAdmin == 0) {
                    JsonLog.writeLog("Unauthorized attempt to delete a user.", "WARNING", "settings_loggingLevel", currentSession, remoteIp);
                    return Results.Unauthorized();
                }
                if (level == LoggingLevels.all || level == LoggingLevels.error_only || level == LoggingLevels.error_and_warning) {
                    JsonLog.writeLog($"Logging level updated to '{level}'.", "INFO", "settings_loggingLevel", currentSession, remoteIp);
                    SettingsDB.updateLoggingLevel(level);
                    return Results.Ok();
                } else {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_paramter, "settings_loggingLevel", null, remoteIp);
                    
                    return Results.BadRequest(errorMessage);
                }
                
            })
            .Produces<ErrorMessage>(StatusCodes.Status400BadRequest)
            .Produces<string>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .WithTags("Settings")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Updates the logging level.",
                Description = "Parameter 'level' can be either 'all', 'error_only', or 'error_and_warning'."
            });

            app.MapGet("/api/settings/loggingLevel", (String sessionKey, HttpContext context) => {
                string? remoteIp = context.Connection.RemoteIpAddress?.ToString();
                SessionInfo? currentSession = Program.Sessions.Find(s => s.Session == sessionKey);
                if (currentSession == null) {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_sessionKey, "settings_loggingLevel", null, remoteIp); 
                    return Results.BadRequest(errorMessage);
                }
                string loggingLevel = SettingsDB.getLoggingLevel();
                return Results.Ok(loggingLevel);
            })
            .Produces<ErrorMessage>(StatusCodes.Status400BadRequest)
            .Produces<string>(StatusCodes.Status200OK)
            .WithTags("Settings")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Gets the current logging level.",
            });

            app.MapGet("/api/settings/progressTrackingMode", (String sessionKey, HttpContext context) => {
                string? remoteIp = context.Connection.RemoteIpAddress?.ToString();
                SessionInfo? currentSession = Program.Sessions.Find(s => s.Session == sessionKey);
                if (currentSession == null) {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_sessionKey, "settings_progressTrackingMode", null, remoteIp); 
                    return Results.BadRequest(errorMessage);
                }
                string progressMode = SettingsDB.getProgressTrackingMode();
                return Results.Ok(progressMode);
            })
            .Produces<ErrorMessage>(StatusCodes.Status400BadRequest)
            .Produces<string>(StatusCodes.Status200OK)
            .WithTags("Settings")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Gets the current progress tracking mode (page or percentage).",
            });

            app.MapPut("/api/settings/progressTrackingMode", (String mode, String sessionKey, HttpContext context) => {
                string? remoteIp = context.Connection.RemoteIpAddress?.ToString();
                SessionInfo? currentSession = Program.Sessions.Find(s => s.Session == sessionKey);
                if (currentSession == null) {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_sessionKey, "settings_progressTrackingMode", null, remoteIp); 
                    return Results.BadRequest(errorMessage);
                }
                if (mode == "page" || mode == "percentage") {
                    JsonLog.writeLog($"Progress tracking mode updated to '{mode}'.", "INFO", "settings_progressTrackingMode", currentSession, remoteIp);
                    SettingsDB.updateProgressTrackingMode(mode);
                    return Results.Ok();
                } else {
                    ErrorMessage errorMessage = JsonLog.logAndCreateErrorMessage(ErrorMessages.invalid_paramter, "settings_progressTrackingMode", null, remoteIp);
                    return Results.BadRequest(errorMessage);
                }
            })
            .Produces<ErrorMessage>(StatusCodes.Status400BadRequest)
            .Produces<string>(StatusCodes.Status200OK)
            .WithTags("Settings")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Updates the progress tracking mode.",
                Description = "Parameter 'mode' can be either 'page' or 'percentage'."
            });

        }

    }

}