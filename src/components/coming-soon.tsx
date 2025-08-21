import { Image } from '@/components/ui/image'
import { SimpleRouteList } from '@/components/custom/route-list'

export default function ComingSoon() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2 px-4'>
        <div className="w-full max-w-sm md:max-w-md lg:max-w-lg mb-4">
          <Image
            src="/src/assets/logo_main.png"
            alt="UGS Logo"
            className="w-full h-auto object-contain"
          />
        </div>
        <h1 className='text-4xl font-bold leading-tight'>Coming Soon 👀</h1>
        <p className='text-center text-muted-foreground'>
          This page has not been created yet. <br />
          Stay tuned though!
        </p>
        <p className='text-center text-muted-foreground'>
          In the meantime, you can check out the other pages.
        </p>
        <div className="container mx-auto py-8">
          <SimpleRouteList />
        </div>
      </div>
    </div>
  )
}