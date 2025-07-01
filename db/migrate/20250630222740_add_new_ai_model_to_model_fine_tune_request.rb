class AddNewAiModelToModelFineTuneRequest < ActiveRecord::Migration[8.0]
  def change
    add_column :model_fine_tune_requests, :new_ai_model_id, :bigint
  end
end
