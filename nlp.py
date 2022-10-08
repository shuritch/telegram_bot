from textblob import TextBlob
from profanity_filter import ProfanityFilter
import sys, json, enchant, jsonpickle
d = enchant.Dict("ru_RU")
pf = ProfanityFilter()
class Person(object):
    def __init__(self, polarity, subjectivity, language, orthography_status, profane_status):
        self.polarity = [polarity]
        self.subjectivity = [subjectivity]
        self.language = [language]
        self.orthography = [orthography_status]
        self.profane = [profane_status]
def main():
    messages = sys.argv[1]
    messages = jsonpickle.decode(messages)
    result = {}
    for message_info in messages:
        if(message_info['type'] != 'message'): continue
        from_id = message_info['from_id']
        message = message_info['text']
        if(type(message) is list): message = message[0]['text']
        if(len(message) == 0): continue
        orthography_status = d.check(message)
        if(orthography_status): orthography_status = 1
        else: orthography_status = 0
        blob = TextBlob(message)
        language = blob.detect_language()
        if(language != 'en'): blob = blob.translate(to='en')
        profane_status = pf.is_clean(str(blob)) 
        if(profane_status): profane_status = 0
        else: profane_status = 1
        polarity = blob.polarity
        subjectivity = blob.subjectivity
        if(from_id in result):
            result[from_id].polarity.append(polarity)
            result[from_id].subjectivity.append(subjectivity)
            if(not(language in result[from_id].language)): result[from_id].language.append(language)
            result[from_id].orthography.append(orthography_status)
            result[from_id].profane.append(profane_status)
        else: result[from_id] = Person(
            polarity, 
            subjectivity, 
            language, 
            orthography_status, 
            profane_status
        )
    print(jsonpickle.encode(result))
if __name__ == '__main__':
    main()