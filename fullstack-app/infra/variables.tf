# infra/variables.tf
variable "prefix" {
  description = "Prefix for all resources"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "East US"
}

variable "db_admin_username" {
  description = "MySQL admin username"
  type        = string
}

variable "db_admin_password" {
  description = "MySQL admin password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "email_user" {
  description = "Email account for sending verification emails"
  type        = string
}

variable "email_pass" {
  description = "Email account password"
  type        = string
  sensitive   = true
}