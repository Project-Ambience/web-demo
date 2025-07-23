class AddFamilityAndParameterToAiModel < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :family, :string
    add_column :ai_models, :parameter_size, :string

    add_column :model_install_requests, :family, :string
    add_column :model_install_requests, :parameter_size, :string
  end
end
