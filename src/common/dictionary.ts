export class Dictionary {
  private static messages: Map<string, Map<DictionaryKey, string>>;

  private static initDictionary() {
    Dictionary.messages = new Map<string, Map<DictionaryKey, string>>();

    const englishMessages = new Map<DictionaryKey, string>();
    // set english messages here
    englishMessages.set("error.inbound.date.after.outbound.date", "Inbound date must be after outbound date");
    englishMessages.set("error.from.iata.code.different.from.to.iata.code", "From IATA code must be different from to IATA code");
    englishMessages.set("error.inbound.date.when.inbound.connection", "Inbound date must be present when inbound connection IATA code is present");
    englishMessages.set("error.outbound.connection.iata.code.different", "Outbound connection IATA code must be different from from IATA code and to IATA code");
    englishMessages.set("error.inbound.connection.iata.code.different", "Inbound connection IATA code must be different from from IATA code and to IATA code");


    const frenchMessages = new Map<DictionaryKey, string>();
    // set french messages here
    frenchMessages.set("error.inbound.date.after.outbound.date", "La date retour doit être après la date départ");
    frenchMessages.set("error.from.iata.code.different.from.to.iata.code", "L'origine doit être différent de la destination");
    frenchMessages.set("error.inbound.date.when.inbound.connection", "La date retour doit être présente quand il y a une escale retour");
    frenchMessages.set("error.outbound.connection.iata.code.different", "L'escale aller doit être différente de l'origine et de la destination");
    frenchMessages.set("error.inbound.connection.iata.code.different", "L'escale retour doit être différente de l'origine et de la destination");


    Dictionary.messages.set("en", englishMessages);
    Dictionary.messages.set("fr", frenchMessages);
  }

  public static getMessage(errorCode: DictionaryKey, language: string = "fr"): string {
    if (!Dictionary.messages) {
      Dictionary.initDictionary();
    }

    const languageMessages = Dictionary.messages.get(language);
    if (languageMessages) {
      const message = languageMessages.get(errorCode);
      if (message) {
        return message;
      }
    }

    const englishMessages = Dictionary.messages.get("en");
    if (englishMessages) {
      const message = englishMessages.get(errorCode);
      if (message) {
        return message;
      }
    }

    return "An error occurred";
  }
}

type DictionaryKey =
  | 'error.inbound.date.after.outbound.date'
  | 'error.from.iata.code.different.from.to.iata.code'
  | 'error.inbound.date.when.inbound.connection'
  | 'error.outbound.connection.iata.code.different'
  | 'error.inbound.connection.iata.code.different';
