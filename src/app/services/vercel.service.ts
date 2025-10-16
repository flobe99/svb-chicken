export default async function handler(req: any, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) {
    await fetch('https://svb-chicken-backend.onrender.com/');
    res.status(200).send('Ping gesendet');
}
