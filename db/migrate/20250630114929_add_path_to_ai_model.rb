class AddPathToAiModel < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :path, :string
  end
end
