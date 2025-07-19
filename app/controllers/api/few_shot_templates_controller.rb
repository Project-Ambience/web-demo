class Api::FewShotTemplatesController < Api::ApplicationController
  before_action :set_template, only: [:show, :update, :destroy]

  def index
    @templates = FewShotTemplate.includes(:examples).order(:name)
    render json: @templates.as_json(include: :examples)
  end

  def show
    render json: @template.as_json(include: :examples)
  end

  def create
    @template = FewShotTemplate.new(template_params)
    if @template.save
      render json: @template.as_json(include: :examples), status: :created
    else
      render json: @template.errors, status: :unprocessable_entity
    end
  end

  def update
    if @template.update(template_params)
      render json: @template.as_json(include: :examples)
    else
      render json: @template.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @template.destroy
    head :no_content
  end

  private

  def set_template
    @template = FewShotTemplate.find(params[:id])
  end

  def template_params
    params.require(:few_shot_template).permit(
      :name,
      :description,
      examples_attributes: [:id, :input, :output, :_destroy]
    )
  end
end
