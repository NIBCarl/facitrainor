User (Trainee) System Architecture
User Pages Needed:

Login Page: Where trainees enter the credentials provided by the admin.

Trainee Dashboard: The main hub showing overall progress, locked/unlocked modules, and attendance status.

Module Content Page: Displays the daily learning materials (text, videos, etc.) and the specific quiz for that page.

Module Review Page: Hosts the overall end-of-module quiz.

Certificate Page: Unlocked only after completing all requirements; contains the download button for the certificate.

Profile Page (Optional but recommended): Where users can change their password or view their cumulative scores.

User Flow:

Authentication: The user logs in using the account created by the admin.

Navigation: They land on the Trainee Dashboard and click on the currently active module.

Daily Learning & Attendance: They read the material on the Module Content Page and answer the page quiz. Submitting this first quiz successfully logs their attendance for the day.

Progression: They proceed through all pages of the daily module.

Review & Unlocking: They navigate to the Module Review Page to take the overall quiz. If they score above 70%, the system unlocks the next module on their dashboard. (If below 70%, they must retake it).

Weekly Milestone: They attend the physical Saturday meetup. (No system action required by the user here).

Completion: Once all modules and Saturday tests are finished (and graded), the Certificate Page unlocks, allowing them to download their proof of completion.

👑 Admin System Architecture
Admin Pages Needed:

Admin Login Page: Secure portal for administrators.

Admin Dashboard: High-level overview of the ongoing training (e.g., total active users, overall completion rates).

User Management Page: Where admins can create new trainee accounts in bulk or individually, reset passwords, and view individual trainee progress.

Content Management Page (CMS): Where admins upload the daily training modules, create the page quizzes, and set the overall review quizzes.

Summative Grading Page: A dedicated data-entry page to manually encode the scores from the physical Saturday meetup tests.

Facilitator Evaluation Dashboard: The final ranking page that aggregates all quiz, review, and summative test scores to highlight top-performing trainees eligible to become facilitators.

Admin Flow:

Setup: The admin logs in, navigates to the User Management Page, and creates accounts for the new batch of trainees. They distribute these credentials offline or via email.

Content Prep: (If not already done) The admin uses the Content Management Page to upload the modules and quizzes.

Monitoring: Throughout the week, the admin can check the Admin Dashboard to ensure trainees are logging in and passing their daily modules.

Data Entry: After the Saturday meetup, the admin takes the physical test papers, opens the Summative Grading Page, and inputs the scores for each trainee.

Evaluation: At the end of the Fcamp program, the admin opens the Facilitator Evaluation Dashboard to view the final, automatically calculated rankings and select the new facilitators.