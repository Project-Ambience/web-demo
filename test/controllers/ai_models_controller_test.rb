require "test_helper"

class AiModelsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get ai_models_index_url
    assert_response :success
  end

  test "should get show" do
    get ai_models_show_url
    assert_response :success
  end

  test "should get new" do
    get ai_models_new_url
    assert_response :success
  end

  test "should get create" do
    get ai_models_create_url
    assert_response :success
  end

  test "should get edit" do
    get ai_models_edit_url
    assert_response :success
  end

  test "should get update" do
    get ai_models_update_url
    assert_response :success
  end

  test "should get destroy" do
    get ai_models_destroy_url
    assert_response :success
  end
end
