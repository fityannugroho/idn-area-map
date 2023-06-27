'use client'

import { config } from '@/utils/config'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Container, { ContainerProps } from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import GitHubIcon from '@mui/icons-material/GitHub'
import Link from '@mui/material/Link'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

export type TPropsNavbar = AppBarProps & {
  /**
   * Determine the max-width of the navbar. The navbar width grows with the size of the screen. Set to false to disable maxWidth.
   *
   * @default 'lg'
   */
  maxWidth?: ContainerProps['maxWidth']
}

/**
 * The Navbar component.
 */
export default function Navbar({
  maxWidth = 'lg',
  ...props
}: TPropsNavbar) {
  const { appName } = config

  return (
    <AppBar {...props}>
      <Container maxWidth={maxWidth}>
        <Toolbar
          disableGutters
          sx={{ justifyContent: 'space-between' }}
        >
          {/* Brand */}
          <Link
            href='/'
            sx={{
              mr: 3.2,
              my: 1.6,
              display: 'flex',
              alignItems: 'center',
              color: 'inherit',
              textDecoration: 'none',
              overflow: 'hidden',
            }}
          >
            <Typography
              variant='h6'
              component='h1'
              noWrap
            >
              {appName}
            </Typography>
          </Link>

          <IconButton
            aria-label='GitHub'
            href='https://github.com/fityannugroho/idn-area-map'
            target='_blank'
            rel='noopener noreferrer'
            color='inherit'
          >
            <GitHubIcon />
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
