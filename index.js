const express = require('express');
const { jwt: { AccessToken }, VoiceGrant } = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;
const outgoingApplicationSid = process.env.OUTGOING_APP_SID;

app.get('/' ,(req,res)=> {
    res.json({msg : "Test"});
});
app.get('/token', (req, res) => {
    const identity = req.query.identity || 'user'; 
    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !outgoingApplicationSid) {
        return res.status(500).json({
            error: 'Twilio credentials are not properly configured.',
        });
    }

    try {
        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: outgoingApplicationSid,
            incomingAllow: true, 
        });

        const token = new AccessToken(
            twilioAccountSid,
            twilioApiKey,
            twilioApiSecret,
            { identity }
        );
        token.addGrant(voiceGrant);

        const jwtToken = token.toJwt();

        res.json({
            identity,
            token: jwtToken,
        });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Error generating token.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
