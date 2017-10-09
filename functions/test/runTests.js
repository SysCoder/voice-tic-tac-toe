var request = {};

request.headers = {
    "host":"us-central1-voice-count.cloudfunctions.net",
    "user-agent":"Mozilla/5.0 (compatible; Google-Cloud-Functions/2.1; +http://www.google.com/bot.html) AppEngine-Google; (+http://code.google.com/appengine; appid: s~gcf-http-proxy)",
    "transfer-encoding":"chunked",
    "content-type":"application/json",
    "function-execution-id":"lei1b282xkc1",
    "google-assistant-api-version":"v1",
    "x-appengine-api-ticket":"aeb7665883bc9c10",
    "x-appengine-city":"?",
    "x-appengine-citylatlong":"0.000000,0.000000",
    "x-appengine-country":"ZZ",
    "x-appengine-https":"on",
    "x-appengine-inbound-appid":"gcf-http-proxy",
    "x-appengine-region":"?",
    "x-appengine-user-ip":"0.1.0.40",
    "x-cloud-trace-context":"60a830a6a187e12bf6ecf357025bd783/7548093970418488961",
    "x-forwarded-for":"66.249.84.244",
    "x-zoo":"app-id=gcf-http-proxy,domain=gmail.com,host=*.cloudfunctions.net",
    "accept-encoding":"gzip"
};

request.body = {
    "user":{
        "user_id":"1502867066459",
        "permissions":[

        ],
        "locale":"en-US"
    },
    "conversation":{
        "conversation_id":"1502867066459",
        "type":2,
        "conversation_token":"{\"state\":null,\"data\":{}}"
    },
    "inputs":[
        {
            "intent":"assistant.intent.action.TEXT",
            "raw_inputs":[
                {
                    "input_type":3,
                    "query":"hi",
                    "annotation_sets":[

                    ]
                }
            ],
            "arguments":[
                {
                    "name":"text",
                    "raw_text":"hi",
                    "text_value":"hi"
                }
            ]
        }
    ],
    "surface":{
        "capabilities":[
            {
                "name":"actions.capability.AUDIO_OUTPUT"
            },
            {
                "name":"actions.capability.SCREEN_OUTPUT"
            }
        ]
    },
    "device":{

    },
    "is_in_sandbox":true
};

request.body = {
    "id":"116c38a6-fce0-4bf7-b2e5-9679acbb338a",
    "timestamp":"2017-08-28T01:17:24.98Z",
    "lang":"en",
    "result":{
        "source":"agent",
        "resolvedQuery":"up",
        "speech":"",
        "action":"",
        "actionIncomplete":false,
        "parameters":{
            "Location":"Top"
        },
        "contexts":[

        ],
        "metadata":{
            "intentId":"d57eafbf-c419-452d-9041-3439055401a8",
            "webhookUsed":"true",
            "webhookForSlotFillingUsed":"false",
            "intentName":"Single Word Move"
        },
        "fulfillment":{
            "speech":"",
            "messages":[
                {
                    "type":0,
                    "speech":""
                }
            ]
        },
        "score":1
    },
    "status":{
        "code":200,
        "errorType":"success"
    },
    "sessionId":"849ef087-e67f-40ec-bb65-bf678da9babf"
};

request.get = function(header) {
    return "v1";
}

var conversation_token = null;
var outputText = null;

var response = {
    status : function (code) {
        // console.log("Status code: " + code);
        return {
            send: function (response) {
                //console.log("Response in test: " + JSON.stringify(response));
                conversation_token = response.conversation_token;
                outputText = response.expected_inputs[0].input_prompt.initial_prompts[0].text_to_speech;
                //console.log("Conversation: " + response.conversation_token);
            },
        };
    },
    append: function () {

    },
};


class ActionFunctionTester {
    constructor (functionUnderTest) {
        this.functionUnderTest = functionUnderTest;
        conversation_token = null;
        outputText = null;
        //request.body.conversation.conversation_token = "{\"state\":null,\"data\":{}}";
    }

    makeUtterance (textUtterance) {
      /*
       if (conversation_token !== null) {
       request.body.conversation.conversation_token = conversation_token;
       }
       request.body.inputs[0].raw_inputs[0].query = textUtterance;
       request.body.inputs[0].arguments[0].raw_text = textUtterance;
       request.body.inputs[0].arguments[0].text_value = textUtterance;
       */
        this.functionUnderTest(request, response);
        return outputText;
    }
}

module.exports = ActionFunctionTester;
