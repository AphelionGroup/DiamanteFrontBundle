<?php
/*
 * Copyright (c) 2014 Eltrino LLC (http://eltrino.com)
 *
 * Licensed under the Open Software License (OSL 3.0).
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://opensource.org/licenses/osl-3.0.php
 *
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@eltrino.com so we can send you a copy immediately.
 */

namespace Diamante\FrontBundle\Tests\Api\Internal;

use Eltrino\PHPUnit\MockAnnotations\MockAnnotations;

use Diamante\FrontBundle\Api\Internal\ResetPasswordService;

class ResetPasswordServiceTest extends \PHPUnit_Framework_TestCase
{

    /**
     * @var ResetPasswordService
     */
    private $resetPasswordService;

    /**
     * @var \Diamante\DeskBundle\Model\User\DiamanteUserRepository
     * @Mock \Diamante\DeskBundle\Model\User\DiamanteUserRepository
     */
    private $diamanteUserRepository;

    protected function setUp()
    {
        MockAnnotations::init($this);

        $this->resetPasswordService = new ResetPasswordService($this->diamanteUserRepository);
    }

    public function testResetPassword()
    {
        $emailAddress = 'max@gmail.com';

        $this->resetPasswordService->resetPassword($emailAddress);
    }

}
 