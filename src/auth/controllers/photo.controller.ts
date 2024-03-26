import { Controller, Patch, Delete, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RolesAuthGuard } from '../roles-auth.guard';
import { UserType } from '../../common/enums/users.enum';
import { Roles } from '../roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../cloudinary/services/cloudinary.service';

@Controller('photo')
@UseGuards(RolesAuthGuard)
export class PhotoController {
    constructor(
        private readonly authService: AuthService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Patch('upload')
    @Roles(UserType.Standard, UserType.Premium)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Req() req
    ) {
        const cloudinaryResponse = await this.cloudinaryService.uploadFile(file, 'profile-pics');
        const imageUrl = cloudinaryResponse.secure_url;
        return await this.authService.updateUserProfilePic(req.user.id, imageUrl);
    }

    @Delete('remove')
    @Roles(UserType.Standard, UserType.Premium)
        async removeProfilePic(@Req() req) {
        return await this.authService.removeUserProfilePic(req.user.id);
    }
}
