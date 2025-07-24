import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function App() {
  const card = (
    <>
      <CardContent>
        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
          Word of the Day
        </Typography>
        <Typography variant='h5' component='div'>
          New Card
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
          adjective
        </Typography>
        <Typography variant='body2'>
          well meaning and kindly.
          <br />
          {'"a benevolent smile"'}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size='small'>Learn More</Button>
      </CardActions>
    </>
  );

  return (
    <>
      <div className='flex justify-center'>
        <Card>{card}</Card>
      </div>
    </>
  );
}

export default App;
