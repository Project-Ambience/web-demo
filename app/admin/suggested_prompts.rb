ActiveAdmin.register SuggestedPrompt do

  # See permitted parameters documentation:
  # https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  # Uncomment all parameters which should be permitted for assignment
  #
  permit_params :prompt, :ai_model_id
  #
  # or
  #
  # permit_params do
  #   permitted = [:prompt, :ai_model_id]
  #   permitted << :other if params[:action] == 'create' && current_user.admin?
  #   permitted
  # end
end
