require "rails_helper"

RSpec.describe "Api::InterRaterFeedbacks", type: :request do
  describe "POST /api/inter_rater_feedbacks" do
    let!(:inter_rater) { create(:inter_rater) }

    context "with valid parameters" do
      let(:valid_params) do
        {
          inter_rater_feedback: {
            inter_rater_id: inter_rater.id,
            rating: "strongly_prefer_first_response",
            comment: "Well reasoned choice"
          }
        }
      end

      it "creates a new InterRaterFeedback" do
        expect {
          post "/api/inter_rater_feedbacks", params: valid_params
        }.to change(InterRaterFeedback, :count).by(1)

        expect(response).to have_http_status(:created)

        json = JSON.parse(response.body)
        expect(json["inter_rater_id"]).to eq(inter_rater.id)
        expect(json["rating"]).to eq("strongly_prefer_first_response")
        expect(json["comment"]).to eq("Well reasoned choice")
      end
    end

    context "with invalid parameters" do
      let(:invalid_params) do
        {
          inter_rater_feedback: {
            inter_rater_id: nil,
            rating: nil,
            comment: ""
          }
        }
      end

      it "does not create a new InterRaterFeedback" do
        expect {
          post "/api/inter_rater_feedbacks", params: invalid_params
        }.not_to change(InterRaterFeedback, :count)

        expect(response).to have_http_status(:unprocessable_entity)

        json = JSON.parse(response.body)
        expect(json["errors"]).to be_an(Array)
        expect(json["errors"]).to include(/Inter rater can't be blank/i).or include(/Rating can't be blank/i)
      end
    end
  end
end
