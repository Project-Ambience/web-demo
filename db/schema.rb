# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_06_12_122418) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "ai_models", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.bigint "clinician_type_id", null: false
    t.text "keywords", default: [], array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["clinician_type_id"], name: "index_ai_models_on_clinician_type_id"
  end

  create_table "clinician_types", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "comments", force: :cascade do |t|
    t.text "comment"
    t.bigint "ai_model_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_model_id"], name: "index_comments_on_ai_model_id"
  end

  create_table "ratings", force: :cascade do |t|
    t.integer "rating"
    t.bigint "ai_model_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_model_id"], name: "index_ratings_on_ai_model_id"
  end

  add_foreign_key "ai_models", "clinician_types"
  add_foreign_key "comments", "ai_models"
  add_foreign_key "ratings", "ai_models"
end
