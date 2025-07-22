require 'rails_helper'

RSpec.describe "Api::FewShotTemplates", type: :request do
  let!(:template1) { create(:few_shot_template, name: "Alpha Template") }
  let!(:template2) { create(:few_shot_template, name: "Beta Template") }
  let!(:example) { create(:example, few_shot_template: template1) }

  describe "GET /api/few_shot_templates" do
    it "returns a list of all templates" do
      get "/api/few_shot_templates"
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response.length).to eq(2)
      expect(json_response.first["name"]).to eq("Alpha Template")
    end
  end

  describe "GET /api/few_shot_templates/:id" do
    it "returns a single template with its examples" do
      get "/api/few_shot_templates/#{template1.id}"
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["name"]).to eq(template1.name)
      expect(json_response["examples"].length).to eq(1)
      expect(json_response["examples"].first["input"]).to eq(example.input)
    end
  end

  describe "POST /api/few_shot_templates" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          few_shot_template: {
            name: "New Template",
            description: "A new description",
            examples_attributes: [
              { input: "new input 1", output: "new output 1" },
              { input: "new input 2", output: "new output 2" }
            ]
          }
        }
      end

      it "creates a new template and its examples" do
        expect {
          post "/api/few_shot_templates", params: valid_params
        }.to change(FewShotTemplate, :count).by(1).and change(Example, :count).by(2)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response["name"]).to eq("New Template")
        expect(json_response["examples"].length).to eq(2)
      end
    end

    context "with invalid parameters" do
      let(:invalid_params) do
        {
          few_shot_template: {
            name: "",
            examples_attributes: [
              { input: "input without output", output: "" }
            ]
          }
        }
      end

      it "does not create a new template and returns validation errors" do
        expect {
          post "/api/few_shot_templates", params: invalid_params
        }.to_not change(FewShotTemplate, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["name"]).to include("can't be blank")
        expect(json_response["examples.output"]).to include("can't be blank")
      end
    end
  end

  describe "PATCH /api/few_shot_templates/:id" do
    context "with valid parameters" do
      let(:update_params) do
        {
          few_shot_template: {
            name: "Updated Name",
            examples_attributes: [
              { id: example.id, input: "Updated Input" }
            ]
          }
        }
      end

      it "updates the template" do
        patch "/api/few_shot_templates/#{template1.id}", params: update_params
        expect(response).to have_http_status(:ok)
        template1.reload
        expect(template1.name).to eq("Updated Name")
        expect(template1.examples.first.input).to eq("Updated Input")
      end
    end
  end

  describe "DELETE /api/few_shot_templates/:id" do
    it "deletes the template and its associated examples" do
      expect {
        delete "/api/few_shot_templates/#{template1.id}"
      }.to change(FewShotTemplate, :count).by(-1).and change(Example, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
