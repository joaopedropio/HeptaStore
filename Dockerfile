# Build React frontend
FROM node:22-alpine AS frontend
WORKDIR /clientapp
COPY ClientApp/package*.json ./
RUN npm ci
COPY ClientApp/ ./
RUN npm run build

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["HeptaStore.csproj", "."]
RUN dotnet restore "./HeptaStore.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./HeptaStore.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./HeptaStore.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
USER root
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=frontend /wwwroot ./wwwroot
RUN mkdir -p /app/uploads && chown $APP_UID /app/uploads
USER $APP_UID
ENTRYPOINT ["dotnet", "HeptaStore.dll"]
