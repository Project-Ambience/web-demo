class AddAdapterPathToAiModels < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :adapter_path, :string
  end
end
