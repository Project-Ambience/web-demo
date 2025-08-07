class Api::ClinicianTypesController < Api::ApplicationController
  def index
    @clinician_types = ClinicianType.includes(ai_models: :ratings).page(params[:page]).per(10)

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
            average_rating: model.average_rating,
            base_model: model.base_model&.name
          }
        end
      }
    end

    render json: {
      data: response_data,
      pagination: {
        current_page: @clinician_types.current_page,
        total_pages: @clinician_types.total_pages,
        total_count: @clinician_types.total_count
      }
    }
  end
end
