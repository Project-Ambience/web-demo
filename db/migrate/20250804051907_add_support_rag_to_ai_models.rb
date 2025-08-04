class AddSupportRagToAiModels < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :support_rag, :boolean, default: false, null: false
  end
end
