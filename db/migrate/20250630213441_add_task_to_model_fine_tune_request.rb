class AddTaskToModelFineTuneRequest < ActiveRecord::Migration[8.0]
  def change
    add_column :model_fine_tune_requests, :task, :string
  end
end
