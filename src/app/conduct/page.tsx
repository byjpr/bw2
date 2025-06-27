export default function ConductPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Code of Conduct</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
          <p>
            We are committed to providing a safe, inclusive, and respectful environment for all community members. 
            This Code of Conduct outlines our expectations for participant behavior as well as the consequences for 
            unacceptable behavior.
          </p>
          <p>
            We invite all those who participate in our community to help us create safe and positive experiences for everyone.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Expected Behavior</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Be respectful and inclusive of all community members.</li>
            <li>Exercise consideration and respect in your speech and actions.</li>
            <li>Attempt collaboration before conflict.</li>
            <li>Refrain from demeaning, discriminatory, or harassing behavior and speech.</li>
            <li>Be mindful of your surroundings and of your fellow participants.</li>
            <li>Alert community organizers if you notice violations of this Code of Conduct.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Unacceptable Behavior</h2>
          <p>The following behaviors are considered unacceptable within our community:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Violence, threats of violence, or violent language directed against another person.</li>
            <li>Discriminatory jokes and language.</li>
            <li>Posting or displaying sexually explicit or violent material.</li>
            <li>Personal insults related to gender, sexual orientation, race, religion, or disability.</li>
            <li>Inappropriate photography or recording.</li>
            <li>Unwelcome sexual attention. This includes sexualized comments or jokes.</li>
            <li>Deliberate intimidation, stalking, or following.</li>
            <li>Sustained disruption of community events, including meetings and presentations.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Age Requirements</h2>
          <p>
            All participants must be at least 18 years of age. By participating in our community, 
            you confirm that you meet this age requirement.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Consequences of Unacceptable Behavior</h2>
          <p>
            Unacceptable behavior from any community member will not be tolerated. Anyone asked to stop unacceptable 
            behavior is expected to comply immediately.
          </p>
          <p>
            If a community member engages in unacceptable behavior, the community organizers may take any action they 
            deem appropriate, up to and including a temporary ban or permanent expulsion from the community without warning.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Reporting Guidelines</h2>
          <p>
            If you are subject to or witness unacceptable behavior, or have any other concerns, please notify a 
            community organizer as soon as possible through the reporting mechanism provided in the platform.
          </p>
          <p>
            All reports will be handled with discretion and will be reviewed and investigated promptly and fairly.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Report Abuse</h2>
          <p>
            If you need to report an incident, please contact the association admin or platform administrators through 
            the provided channels in the platform.
          </p>
          <div className="mt-4">
            <a 
              href="/feedback"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Report an Issue
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}