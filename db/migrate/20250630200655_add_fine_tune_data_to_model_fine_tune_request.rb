class AddFineTuneDataToModelFineTuneRequest < ActiveRecord::Migration[8.0]
  def change
    add_column :model_fine_tune_requests, :fine_tune_data, :jsonb, default: {}
  end
end
