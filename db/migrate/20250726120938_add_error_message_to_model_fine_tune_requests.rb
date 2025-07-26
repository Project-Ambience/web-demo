class AddErrorMessageToModelFineTuneRequests < ActiveRecord::Migration[8.0]
  def change
    add_column :model_fine_tune_requests, :error_message, :text
  end
end
