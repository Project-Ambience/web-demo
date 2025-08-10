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

ActiveRecord::Schema[8.0].define(version: 2025_08_04_095128) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_admin_comments", force: :cascade do |t|
    t.string "namespace"
    t.text "body"
    t.string "resource_type"
    t.bigint "resource_id"
    t.string "author_type"
    t.bigint "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_type", "author_id"], name: "index_active_admin_comments_on_author"
    t.index ["namespace"], name: "index_active_admin_comments_on_namespace"
    t.index ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "ai_models", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.bigint "clinician_type_id", null: false
    t.text "keywords", default: [], array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "fine_tune_data_format", default: {}
    t.boolean "allow_fine_tune", default: false
    t.bigint "base_model_id"
    t.string "path"
    t.string "adapter_path"
    t.string "speciality"
    t.string "family"
    t.string "parameter_size"
    t.string "fine_tuning_notes"
    t.boolean "support_rag", default: false, null: false
    t.index ["base_model_id"], name: "index_ai_models_on_base_model_id"
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

  create_table "conversations", force: :cascade do |t|
    t.string "title"
    t.bigint "ai_model_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "status", default: 0, null: false
    t.jsonb "few_shot_template"
    t.boolean "cot", default: false, null: false
    t.boolean "rag", default: false, null: false
    t.index ["ai_model_id"], name: "index_conversations_on_ai_model_id"
  end

  create_table "examples", force: :cascade do |t|
    t.text "input", null: false
    t.text "output", null: false
    t.bigint "few_shot_template_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["few_shot_template_id"], name: "index_examples_on_few_shot_template_id"
  end

  create_table "few_shot_templates", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "fine_tune_tasks", force: :cascade do |t|
    t.string "title"
    t.jsonb "parameters"
    t.bigint "ai_model_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_model_id"], name: "index_fine_tune_tasks_on_ai_model_id"
  end

  create_table "inter_rater_feedbacks", force: :cascade do |t|
    t.bigint "inter_rater_id", null: false
    t.integer "rating", null: false
    t.string "comment", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["inter_rater_id"], name: "index_inter_rater_feedbacks_on_inter_rater_id"
  end

  create_table "inter_raters", force: :cascade do |t|
    t.bigint "first_conversation_id", null: false
    t.bigint "second_conversation_id", null: false
    t.bigint "ai_model_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_model_id"], name: "index_inter_raters_on_ai_model_id"
    t.index ["first_conversation_id"], name: "index_inter_raters_on_first_conversation_id"
    t.index ["second_conversation_id"], name: "index_inter_raters_on_second_conversation_id"
  end

  create_table "messages", force: :cascade do |t|
    t.string "role"
    t.text "content"
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
  end

  create_table "model_fine_tune_requests", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.bigint "ai_model_id", null: false
    t.bigint "clinician_type_id", null: false
    t.jsonb "parameters", default: {}
    t.integer "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "fine_tune_data", default: {}
    t.string "task"
    t.bigint "new_ai_model_id"
    t.string "fine_tuning_notes"
    t.text "error_message"
    t.index ["ai_model_id"], name: "index_model_fine_tune_requests_on_ai_model_id"
    t.index ["clinician_type_id"], name: "index_model_fine_tune_requests_on_clinician_type_id"
  end

  create_table "model_install_requests", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.bigint "clinician_type_id", null: false
    t.string "keyword"
    t.integer "status"
    t.string "path"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "family"
    t.string "parameter_size"
    t.index ["clinician_type_id"], name: "index_model_install_requests_on_clinician_type_id"
  end

  create_table "rag_data_adding_requests", force: :cascade do |t|
    t.integer "status", default: 0, null: false
    t.string "error_log"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ratings", force: :cascade do |t|
    t.integer "rating"
    t.bigint "ai_model_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_model_id"], name: "index_ratings_on_ai_model_id"
  end

  create_table "suggested_prompts", force: :cascade do |t|
    t.string "prompt"
    t.bigint "ai_model_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_model_id"], name: "index_suggested_prompts_on_ai_model_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "ai_models", "ai_models", column: "base_model_id"
  add_foreign_key "ai_models", "clinician_types"
  add_foreign_key "comments", "ai_models"
  add_foreign_key "conversations", "ai_models"
  add_foreign_key "examples", "few_shot_templates"
  add_foreign_key "fine_tune_tasks", "ai_models"
  add_foreign_key "inter_rater_feedbacks", "inter_raters"
  add_foreign_key "inter_raters", "ai_models"
  add_foreign_key "inter_raters", "conversations", column: "first_conversation_id"
  add_foreign_key "inter_raters", "conversations", column: "second_conversation_id"
  add_foreign_key "messages", "conversations"
  add_foreign_key "model_fine_tune_requests", "ai_models"
  add_foreign_key "model_fine_tune_requests", "clinician_types"
  add_foreign_key "model_install_requests", "clinician_types"
  add_foreign_key "ratings", "ai_models"
  add_foreign_key "suggested_prompts", "ai_models"
end
