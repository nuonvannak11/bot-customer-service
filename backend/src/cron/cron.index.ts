import cron from 'node-cron';

export default function cronJob() {
    try {
        cron.schedule('* * * * *', () => {
            // console.log('Running every 1 minute');
        });
    } catch (err) {
        console.log(err);
    }
}
