class CreateRagDataAddingRequest < ActiveRecord::Migration[8.0]
  def change
    create_table :rag_data_adding_requests do |t|
      t.integer :status, null: false, default: 0
      t.string :error_log

      t.timestamps
    end
  end
end
