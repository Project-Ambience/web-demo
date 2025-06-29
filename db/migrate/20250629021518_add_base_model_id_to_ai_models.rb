class AddBaseModelIdToAiModels < ActiveRecord::Migration[8.0]
  def change
    add_reference :ai_models, :base_model, foreign_key: { to_table: :ai_models }
  end
end
