FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app
COPY Booktracker/*.csproj ./
RUN dotnet restore
COPY Booktracker/. ./
RUN dotnet build -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

COPY Booktracker/init.sql ./
COPY Booktracker/wwwroot ./wwwroot/

# Create external directory structure for database, logs, and exports
RUN mkdir -p external/db external/log external/export

EXPOSE 5000

CMD dotnet Booktracker.dll
