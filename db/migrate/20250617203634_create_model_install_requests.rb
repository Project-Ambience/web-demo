class CreateModelInstallRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :model_install_requests do |t|
      t.string :name
      t.string :description
      t.references :clinician_type, null: false, foreign_key: true
      t.string :keyword
      t.integer :status
      t.string :path

      t.timestamps
    end
  end
end
