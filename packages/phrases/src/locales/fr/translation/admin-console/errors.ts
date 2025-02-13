const errors = {
  something_went_wrong: 'Oups ! Quelque chose a mal tourné.',
  page_not_found: 'Page non trouvée',
  unknown_server_error: "Une erreur de serveur inconnu s'est produite",
  empty: 'Pas de données',
  missing_total_number: 'Impossible de trouver le nombre total dans les en-têtes de réponse',
  invalid_uri_format: "Format d'URI non valide",
  invalid_origin_format: "Format d'origine URI non valide",
  invalid_json_format: 'Format JSON non valide',
  invalid_error_message_format: "Le format du message d'erreur n'est pas valide.",
  required_field_missing: 'Veuillez saisir {{field}}',
  required_field_missing_plural: 'Vous devez entrer au moins un {{field}}.',
  more_details: 'Plus de détails',
  username_pattern_error:
    "Le nom d'utilisateur ne doit contenir que des lettres, des chiffres ou des traits de soulignement et ne doit pas commencer par un chiffre.",
  password_pattern_error:
    'Password requires a minimum of {{min}} characters and contains a mix of letters, numbers, and symbols.', // UNTRANSLATED
  insecure_contexts: 'Les contextes non sécurisés (non HTTPS) ne sont pas pris en charge.',
  unexpected_error: "Une erreur inattendue s'est produite",
  not_found: '404 not found', // UNTRANSLATED
  create_internal_role_violation:
    'You are creating a new internal role which is forbidden by Logto. Try another name that does not start with "#internal:".', // UNTRANSLATED
};

export default errors;
