ActiveAdmin.register ClinicianType do
  permit_params :name

  filter :id
  filter :name
  filter :created_at
  filter :updated_at
end
