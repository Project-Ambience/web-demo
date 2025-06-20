class Api::ClinicianTypesController < Api::ApplicationController
  def index
    @clinician_types = ClinicianType.includes(ai_models: :ratings).all

    response_data = @clinician_types.map do |type|
      {
        id: type.id,
        name: type.name,
        created_at: type.created_at,
        updated_at: type.updated_at,
        ai_models: type.ai_models.map do |model|
          {
            id: model.id,
            name: model.name,
            description: model.description,
            clinician_type_id: model.clinician_type_id,
            created_at: model.created_at,
            updated_at: model.updated_at,
            average_rating: model.average_rating
          }
        end
      }
    end

    render json: response_data
  end
end
