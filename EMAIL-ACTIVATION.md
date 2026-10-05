# Automatic email enquiries — සක්‍රිය කරන පියවර

ලැබෙන email ලිපිනය: **serandib.enquiries@gmail.com**

1. Updated project එක GitHub repository එකේ `main` branch එකට push කරන්න. Settings → Pages → Source ලෙස **GitHub Actions** තෝරන්න.
2. Deployment එක successful වූ පසු live website එකේ enquiry form එකට ඔයාට අයිති email එකක් යොදා **TEST — email setup** ලෙස test enquiry එකක් submit කරන්න. Spam verification එකක් ආවොත් complete කරන්න.
3. **serandib.enquiries@gmail.com** inbox/Spam බලලා FormSubmit එවන activation email එකේ confirmation link එක click කරන්න. මෙය පළමු භාවිතයේදී අවශ්‍ය verification එකයි.
4. Live website එකෙන් තවත් test enquiry එකක් submit කරලා, සම්පූර්ණ details ඇතුළත් email එක inbox එකට ලැබෙන බව තහවුරු කරන්න. Reply කළාම customer දුන්න email address එකට යන බවත් බලන්න.

ඉන්පස්සේ client form එක fill කරලා **Send enquiry** කළ විට FormSubmit හරහා ඔයාලට email එක යැවෙයි. Clientගේ email app එක open කිරීම අවශ්‍ය නැහැ. අවශ්‍ය නම් spam-prevention check එකක් එයි.

**දැනට code integration සහ local tests සම්පූර්ණයි. Live deployment, inbox activation සහ සැබෑ email receipt මේ chat එකෙන් verify කරලා නැහැ.** Activation එක මඟහැරලා site එක clientsට share කරන්න එපා.

Email නොලැබුණොත් recipient spelling, activation සහ Spam folder බලන්න. Recipient email/domain වෙනස් කළොත් activation නැවත check කරන්න. Email delivery එක FormSubmit service එක සහ mail filtering මත රඳා පවතී. Site එකේ WhatsApp/email draft alternativesත් තබා ඇත.

Official instructions: https://formsubmit.co/documentation · https://formsubmit.co/help
