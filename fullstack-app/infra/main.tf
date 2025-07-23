# infra/main.tf
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

# App Service Plan
resource "azurerm_service_plan" "frontend" {
  name                = "${var.prefix}-frontend-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_service_plan" "backend" {
  name                = "${var.prefix}-backend-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# App Services
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.prefix}-frontend-app"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.frontend.location
  service_plan_id     = azurerm_service_plan.frontend.id

  site_config {
    application_stack {
      node_version = "18"
    }
  }

  app_settings = {
    "REACT_APP_API_URL" = "https://${azurerm_linux_web_app.backend.default_hostname}"
  }
}

resource "azurerm_linux_web_app" "backend" {
  name                = "${var.prefix}-backend-app"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.backend.location
  service_plan_id     = azurerm_service_plan.backend.id

  site_config {
    application_stack {
      node_version = "18"
    }
  }

  app_settings = {
    "DB_HOST"     = azurerm_mysql_server.main.fqdn
    "DB_USER"     = var.db_admin_username
    "DB_PASSWORD" = var.db_admin_password
    "DB_NAME"     = azurerm_mysql_database.main.name
    "JWT_SECRET"  = var.jwt_secret
    "EMAIL_USER"  = var.email_user
    "EMAIL_PASS"  = var.email_pass
  }
}

# MySQL Database
resource "azurerm_mysql_server" "main" {
  name                = "${var.prefix}-mysql-server"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  administrator_login          = var.db_admin_username
  administrator_login_password = var.db_admin_password

  sku_name   = "B_Gen5_1"
  storage_mb = 5120
  version    = "8.0"

  auto_grow_enabled                 = true
  backup_retention_days             = 7
  geo_redundant_backup_enabled      = false
  infrastructure_encryption_enabled = false
  public_network_access_enabled    = true
  ssl_enforcement_enabled          = true
}

resource "azurerm_mysql_database" "main" {
  name                = "${var.prefix}-database"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_server.main.name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"
}